"""Record full Azure runs and export a short excerpt using the notebook workflow."""

import asyncio
import json
import os
from pathlib import Path
import subprocess
from tempfile import TemporaryDirectory

import imageio_ffmpeg

ROOT = Path(__file__).resolve().parents[1]
SECONDS = 30
VIEWPORT = {"width": 900, "height": 660}
MARKER = (20, 184, 166)


def load_workflow():
    notebook = json.loads((ROOT / "browser_agent.ipynb").read_text(encoding="utf-8"))
    namespace = {"__name__": "recorded_workflow"}
    for cell in notebook["cells"]:
        if "definitions" in cell.get("metadata", {}).get("tags", []):
            exec("".join(cell["source"]), namespace)
    namespace["DECISION_PROVIDER"] = "foundry"
    namespace["TEXT_PROVIDER"] = "azure"
    return namespace


async def capture(selector, directory):
    workflow = load_workflow()
    marked = False
    original_observe = workflow["observe"]

    async def observe(browser):
        nonlocal marked
        snapshot, actions = await original_observe(browser)
        if not marked:
            # A visual marker aligns recordings at the first decision. It is
            # excluded from accessibility state and cropped out of the export.
            await browser.call_tool("browser_evaluate", {"function": """() => {
                const marker = document.createElement('div');
                marker.setAttribute('aria-hidden', 'true');
                marker.style.cssText = 'position:fixed;right:0;bottom:0;width:12px;'
                    + 'height:12px;background:rgb(20,184,166);z-index:2147483647';
                document.body.append(marker);
            }"""})
            marked = True
        return snapshot, actions

    workflow["observe"] = observe
    directory.mkdir()
    config = directory / "browser.json"
    config.write_text(json.dumps({"browser": {"contextOptions": {
        "viewport": VIEWPORT,
        "recordVideo": {"dir": str(directory), "size": VIEWPORT}}}}), encoding="utf-8")
    result = await workflow["run_browser_task"](workflow[selector], browser_args=("--config", str(config)))
    print(json.dumps(result["inquiries"], indent=2, ensure_ascii=False), flush=True)
    return next(directory.glob("*.webm")), result



def first_decision_offset(path):
    frames = imageio_ffmpeg.read_frames(str(path))
    info = next(frames)
    width, height = info["size"]
    pixel = ((height - 6) * width + width - 6) * 3
    try:
        for index, frame in enumerate(frames):
            if all(abs(frame[pixel + channel] - color) < 25 for channel, color in enumerate(MARKER)):
                return index / info["fps"]
    finally:
        frames.close()
    raise RuntimeError("The recording's alignment marker was not found.")


def compose(left, right):
    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    offsets = [first_decision_offset(path) for path in (left, right)]
    font = (Path("C:/Windows/Fonts/segoeui.ttf") if os.name == "nt"
            else Path("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"))
    text = f"drawtext=fontfile={font.name}:fontcolor=white"
    graph = (
        f"[0:v]trim=start={offsets[0]}:duration={SECONDS},setpts=PTS-STARTPTS,crop=iw:ih-16:0:0[l];"
        f"[1:v]trim=start={offsets[1]}:duration={SECONDS},setpts=PTS-STARTPTS,crop=iw:ih-16:0:0[r];"
        "[l][r]hstack=inputs=2,pad=iw:ih+72:0:72:color=0x13251e,"
        f"{text}:fontsize=32:x=28:y=20:text='Decision-1 + GPT-6-Luna',"
        f"{text}:fontsize=32:x=928:y=20:text='Pure GPT-6-Luna'"
    )
    output = ROOT / "media/comparison.mp4"
    subprocess.run([ffmpeg, "-hide_banner", "-loglevel", "error", "-y", "-i", str(left),
        "-i", str(right), "-filter_complex", graph, "-t", str(SECONDS), "-an",
        "-c:v", "libx264", "-crf", "19", "-pix_fmt", "yuv420p", "-movflags", "+faststart",
        str(output)], check=True, cwd=font.parent)
    subprocess.run([ffmpeg, "-hide_banner", "-loglevel", "error", "-y", "-i", str(output),
        "-filter_complex", "fps=12,scale=1200:-1:flags=lanczos,split[a][b];[a]palettegen[p];[b][p]paletteuse",
        "-loop", "0", str(output.with_suffix(".gif"))], check=True)
    print("Created", output, "and its GIF preview.", flush=True)


async def main():
    os.chdir(ROOT)
    with TemporaryDirectory() as temporary:
        folder = Path(temporary)
        left, hybrid = await capture("choose_decision", folder / "hybrid")
        right, luna = await capture("choose_luna", folder / "luna")
        for label, result in [("Decision-1 + GPT-6-Luna", hybrid), ("Pure GPT-6-Luna", luna)]:
            print(label, {key: value for key, value in result.items() if key != "inquiries"}, flush=True)
        compose(left, right)


if __name__ == "__main__":
    asyncio.run(main())
