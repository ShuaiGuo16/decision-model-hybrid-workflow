# Short browser comparison

This helper uses the notebook's tagged definition cells. It records each full run sequentially and exports a 30-second comparison aligned at the first decision, without changing playback speed. The only overlays are the labels "Decision-1 + GPT-6-Luna" and "Pure GPT-6-Luna".

```powershell
.\.venv\Scripts\python.exe -m pip install -r media/requirements.txt
.\.venv\Scripts\python.exe media/record_demo.py
```

Both runs use Azure, the same viewport, instructions, and task. The included [comparison.mp4](comparison.mp4) was recorded on 16 October 2026 and shows the hybrid workflow progressing through hotel selection, the inquiry form, and review. The notebook retains its saved results from 14 October 2026; the new recording does not replace those measurements.

The helper exports `comparison.mp4` and a looping GIF preview. A cropped alignment marker synchronizes the clips. Full raw captures and MCP configuration files are temporary. Recording settings and FFmpeg stay outside the teaching notebook. Rerunning this helper prints new results and replaces the exports; it does not overwrite the notebook's saved outputs.

Model calls incur charges. The notebook's normal installation does not require this extra dependency.

## Article figures

- [Workflow diagram](workflow-styled.png) and its [editable SVG](workflow-styled.svg).
- [Hotel-search website screenshot](hotel-search.png).
