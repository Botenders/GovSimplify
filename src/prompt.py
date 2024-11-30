from datetime import datetime
from jinja2 import Template
from typing import Tuple

from src.agencies import fetch_agency, fetch_doc_summaries


TEMPLATE = """
You are a policy analyst specializing in regulatory and policy analysis. Your role is to review and provide insights based on the provided regulatory documents, focusing on:
1. Policy Objectives and Scope
2. Stakeholder Impacts
3. Compliance Requirements
4. Potential Risks and Benefits

When analyzing these documents, **prioritize relevance** and **fetch only the most critical documents** by invoking the `fetch_document_details` function using the provided document links. **Minimize unnecessary fetches** to ensure efficiency and focus.

Your workflow should include:
1. **Proactively Analyze Metadata**:
   - Use the metadata provided (e.g., title, document type, dates) to determine the relevance of each document to the analysis.
   - Prioritize documents based on:
     - Importance of the policy (e.g., regulations, executive orders, or critical stakeholder impacts).
     - Recency or update relevance (e.g., recent modifications or new publications).
     - Missing key information required for compliance or analysis.
   - Avoid fetching documents that are unlikely to impact the analysis or contain redundant information.

2. **Fetch and Analyze Select Documents**:
   - Fetch only a limited number of highly relevant documents (e.g., up to 3-5) that are essential for compliance analysis or stakeholder impact evaluation.
   - For documents with sufficient metadata or summaries, do not fetch unless absolutely necessary.

3. **Ensure Comprehensive Insights**:
   - For each document:
     - Evaluate the policy's purpose, background, and requirements.
     - Analyze stakeholder impacts, compliance obligations, and associated risks or opportunities.
   - Focus on actionable insights without fetching unnecessary details.

4. **Prioritize Key Policy Insights**:
   - Focus on the purpose and background of policies, specific requirements or actions described, and relevant deadlines.
   - Consider potential effects on stakeholders (e.g., individuals, businesses, agencies) and implications for enforcement or compliance.

Documents for Analysis:
{% for doc in documents %}
---
**Title**: {{ doc.attributes.title | default('No title available') }}
**Document Type**: {{ doc.attributes.documentType | default('Unknown') }}
**Published On**: {{ doc.attributes.postedDate | default('Unknown date') }}
**Last Modified**: {{ doc.attributes.lastModifiedDate | default('Unknown date') }}
**Withdrawn**: {{ doc.attributes.withdrawn | default('No') }}
**Link (required for `fetch_document_details` function call)**: {{ doc.links.self | default('No link available') }}
{% if doc.summary %}
**Content Summary**: {{ doc.summary }}
{% else %}
**Action Required**: Full content is missing. Fetch only if the document is highly relevant to the analysis based on its type, recency, or criticality.
{% endif %}
---
{% endfor %}

---

**Critical Note**:
- Analyze metadata first to identify a small subset of highly relevant documents (e.g., 3-5) for further detail retrieval.
- Only fetch documents that are critical to understanding key policy impacts or compliance requirements.
- Avoid unnecessary fetches by relying on metadata and summaries wherever possible.
- Always aim to deliver a complete and actionable analysis with minimal reliance on document fetches.
"""


def generate_prompt(api_key: str, agency: str) -> str:
    data = fetch_agency(api_key, agency)
    documents = fetch_doc_summaries(api_key, data)

    template = Template(TEMPLATE)
    prompt = template.render(documents=documents)

    current_date = datetime.now().strftime("%Y-%m-%d")
    prompt = f"{prompt}\n\n---\n\n**Current Date:** {current_date}."

    return prompt


def determine_model_and_tokens(
    prompt: str, token_limit: int = 2_000_000
) -> Tuple[int, str]:
    """
    Determines the approximate token count for a given system instruction and selects the appropriate model.

    Args:
        prompt (str): The rendered system prompt.
        token_limit (int): Maximum token limit for the context. Defaults to 2 million.

    Returns:
        tuple: (approx_tokens, model_name)
    """
    # Calculate approximate token count (4 characters per token approximation)
    approx_tokens = len(prompt) // 4

    # Check if token count exceeds the limit
    if approx_tokens > token_limit:
        raise ValueError(f"Token count exceeds the limit of {token_limit}.")

    # Determine model based on token count thresholds
    model_name = "gemini-1.5-pro" if approx_tokens > 900_000 else "gemini-1.5-flash"

    return approx_tokens, model_name
