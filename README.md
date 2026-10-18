# Decision Models in Action: Build a Hybrid LLM Workflow

The complete teaching implementation is [browser_agent.ipynb](browser_agent.ipynb). Python runs observe-decide-act, Azure Decision-1 chooses actions, Playwright MCP executes them, and GPT-6-Luna fills text fields when selected. A second run substitutes GPT-6-Luna through the Responses API for action selection.

## Setup

Use Python 3.11+, Node.js 20+, and installed Google Chrome:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
npm.cmd ci
```

On macOS/Linux, use `.venv/bin/python` and `npm ci`. Copy `.env.example` to `.env`, supply your Azure resource endpoint and key, and select `.venv` as the notebook kernel. Run the cells from top to bottom. These runs make paid requests.

The Azure defaults are `Decision-1` and `gpt-6-luna`, sharing one endpoint and `AZURE_API_KEY`. Use the deployment names from your Azure resource. The fictional travel site lives in `app/`; no inquiries are sent and nothing is booked. The task description is the only task input. The adapter offers calendar and other button clicks, dropdown selections, checkbox clicks, and GPT-6-Luna filling for text fields. Dates are selected through an in-page calendar; no separate values or field mappings are supplied.

## Provider flexibility

The API functions retain explicit provider branches. Set `DECISION_PROVIDER` to `foundry`, `openrouter`, or `openai`; set `TEXT_PROVIDER` to `azure`, `openrouter`, or `openai`. Azure is the concrete walkthrough example. OpenRouter uses `OPENROUTER_API_KEY` and `OPENROUTER_DECISION_MODEL`; direct OpenAI uses `OPENAI_API_KEY`.

Azure and OpenRouter use `state`, named questions, and `criteria`. Direct OpenAI uses `input`, a question list, and `choices`. These differences stay inside `choose_decision`; the browser loop is shared. The writer and Pure GPT-6-Luna baseline both use Responses, explicit reasoning effort `none`, and a 256-token output budget. Both model paths share a small HTTP retry helper: up to three attempts for transport failures and HTTP 408/429/500/502/503/504, with one- and two-second waits. Retries are printed and included in reported latency and total time. Selection/writing counts represent logical operations, not HTTP attempts.

## Results and inspection

The notebook contains saved action traces, final inquiries, and comparison output from two full Azure runs on 14 October 2026. Decision-1 plus GPT-6-Luna completed in **41.03 s** (19 selections, 3 text fills; median selection 465 ms). Pure GPT-6-Luna completed in **156.32 s** (17 selections, 3 text fills; median selection 6384 ms). Both saved inquiries were manually inspected and correct; neither run retried an HTTP request. This is one illustrative pair, with recording enabled for both at the same viewport, rather than a benchmark. The shorter path taken by GPT-6-Luna is visible in its trace.

The workflow stops when the controller chooses `done` or `blocked` and displays the saved inquiry for manual inspection. There is no automated task judge or completion checker. Both variants share the task, core instructions, action construction, executor, and writer. Their actual page states can differ as they choose different actions. Timing excludes startup, navigation, and final output display.

## Short visual demo

Recording and composition live separately in [media/](media/README.md). The helper reuses the notebook's tagged definitions and records two full Azure runs sequentially, then exports a 30-second comparison without changing playback speed. The included [MP4](media/comparison.mp4) was recorded on 16 October 2026, separately from the notebook's saved measurements. The only overlays are the two model labels.

Browser settings are passed through the loop's generic `browser_args` option; the notebook contains no recording logic. The media folder also contains the [workflow diagram](media/workflow-styled.png), its [editable SVG](media/workflow-styled.svg), and a [website screenshot](media/hotel-search.png).
