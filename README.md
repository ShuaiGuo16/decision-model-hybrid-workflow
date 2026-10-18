# Decision Models in Action: Build a Hybrid LLM Workflow

A hands-on browser automation tutorial combining **Decision-1** for operation selection, **GPT-6-Luna** for text generation, and **Python + Playwright MCP** for orchestration. The workflow searches a fictional hotel website and saves an inquiry locally.

Start with [browser_agent.ipynb](browser_agent.ipynb), which contains the implementation, saved outputs, and a comparison with Pure GPT-6-Luna.

## Setup

You need Python 3.11+, Node.js 20+, Google Chrome, and access to the models.

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
npm.cmd ci
```

On macOS/Linux, use `.venv/bin/python` and `npm ci`.

Copy [.env.example](.env.example) to `.env` and set your Azure endpoint, API key, and deployment names. The defaults are `Decision-1` and `gpt-6-luna`. Select `.venv` as the notebook kernel and run the cells in order. Model calls incur charges.

## Model options

Azure is the main example. The notebook also supports OpenRouter and direct OpenAI endpoints through `DECISION_PROVIDER` and `TEXT_PROVIDER`; the browser workflow stays the same.

## Example results

| Workflow | Completion time |
|---|---:|
| Decision-1 + GPT-6-Luna | 41.03 s |
| Pure GPT-6-Luna | 156.32 s |

Both completed the task correctly. The comparison changes the selection model while keeping the browser tools and text-filling function shared.

## Media

- [Workflow diagram](media/workflow-styled.png) ([SVG](media/workflow-styled.svg))
- [Website screenshot](media/hotel-search.png)
- [Side-by-side video](media/comparison.mp4), showing separate runs at normal speed
- [Recording instructions](media/README.md)
