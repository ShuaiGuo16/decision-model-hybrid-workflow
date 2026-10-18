# Demo media

[Watch the comparison](comparison.mp4): Decision-1 + GPT-6-Luna alongside Pure GPT-6-Luna, played at normal speed. The video shows separate runs from the notebook's saved comparison.

To create a new recording from the notebook's definitions:

```powershell
.\.venv\Scripts\python.exe -m pip install -r media/requirements.txt
.\.venv\Scripts\python.exe media/record_demo.py
```

The helper records both workflows and exports a 30-second comparison plus a GIF preview. Rerunning replaces the exports and makes paid model calls.

## Figures

- [Workflow diagram](workflow-styled.png) ([SVG](workflow-styled.svg))
- [Website screenshot](hotel-search.png)
