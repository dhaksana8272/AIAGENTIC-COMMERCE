# """
# Primary agent-payment path: calls Razorpay's official hosted MCP server
# (mcp.razorpay.com) as MCP tools, the same way an external AI shopping
# agent would. If the MCP call fails for any reason (network, auth,
# tool schema mismatch), we transparently fall back to the direct SDK
# so the demo never stalls — and we log WHICH path executed in the
# audit trail, since that's a legitimate part of the "explainable" story.
# """
# import os
# import base64
# from typing import Optional

# from razorpay_client import sdk_client

# RAZORPAY_MCP_URL = os.getenv("RAZORPAY_MCP_URL", "https://mcp.razorpay.com/mcp")
# _KEY_ID = os.getenv("RAZORPAY_KEY_ID")
# _KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")


# def _auth_header() -> str:
#     token = base64.b64encode(f"{_KEY_ID}:{_KEY_SECRET}".encode()).decode()
#     return f"Basic {token}"


# async def call_tool(tool_name: str, arguments: dict) -> dict:
#     """
#     Attempts the MCP tool call over streamable HTTP using the `mcp` python
#     SDK. On any failure, falls back to the direct SDK and tags the result
#     so the audit log can show which path actually executed.
#     """
#     try:
#         from mcp import ClientSession
#         from mcp.client.streamable_http import streamablehttp_client

#         async with streamablehttp_client(
#             RAZORPAY_MCP_URL,
#             headers={"Authorization": _auth_header()},
#         ) as (read, write, _):
#             async with ClientSession(read, write) as session:
#                 await session.initialize()
#                 result = await session.call_tool(tool_name, arguments)
#                 content = result.content[0].text if result.content else "{}"
#                 return {"_path": "mcp", "raw": content}
#     except Exception as e:
#         return _fallback(tool_name, arguments, str(e))


# def _fallback(tool_name: str, arguments: dict, error: str) -> dict:
#     if tool_name == "create_payment_link":
#         result = sdk_client.create_payment_link(
#             amount_inr=arguments["amount_inr"],
#             description=arguments.get("description", "Order payment"),
#         )
#         return {"_path": "sdk_fallback", "_mcp_error": error, "raw": result}

#     if tool_name == "fetch_payment":
#         result = sdk_client.fetch_payment(arguments["payment_id"])
#         return {"_path": "sdk_fallback", "_mcp_error": error, "raw": result}

#     raise RuntimeError(f"No SDK fallback implemented for tool '{tool_name}': {error}")




"""
Primary agent-payment path: calls Razorpay's official hosted MCP server
(mcp.razorpay.com) as MCP tools, the same way an external AI shopping
agent would. If the MCP call fails for any reason (network, auth,
tool schema mismatch), we transparently fall back to the direct SDK
so the demo never stalls — and we log WHICH path executed in the
audit trail, since that's a legitimate part of the "explainable" story.
"""
import os
import json
import base64
from typing import Optional

from razorpay_client import sdk_client

RAZORPAY_MCP_URL = os.getenv("RAZORPAY_MCP_URL", "https://mcp.razorpay.com/mcp")
_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")


def _auth_header() -> str:
    token = base64.b64encode(f"{_KEY_ID}:{_KEY_SECRET}".encode()).decode()
    return f"Basic {token}"


async def call_tool(tool_name: str, arguments: dict) -> dict:
    """
    Attempts the MCP tool call over streamable HTTP using the `mcp` python
    SDK. On any failure, falls back to the direct SDK and tags the result
    so the audit log can show which path actually executed.
    """
    try:
        from mcp import ClientSession
        from mcp.client.streamable_http import streamablehttp_client

        async with streamablehttp_client(
            RAZORPAY_MCP_URL,
            headers={"Authorization": _auth_header()},
        ) as (read, write, _):
            async with ClientSession(read, write) as session:
                await session.initialize()
                result = await session.call_tool(tool_name, arguments)
                if getattr(result, "isError", False):
                    error_text = result.content[0].text if result.content else "Unknown MCP error"
                    raise RuntimeError(f"MCP tool '{tool_name}' returned an error: {error_text}")
                content = result.content[0].text if result.content else "{}"
                try:
                    parsed = json.loads(content)
                except (json.JSONDecodeError, TypeError):
                    parsed = {"raw_text": content}
                return {"_path": "mcp", "raw": parsed}
    except Exception as e:
        return _fallback(tool_name, arguments, str(e))


def _fallback(tool_name: str, arguments: dict, error: str) -> dict:
    if tool_name == "create_payment_link":
        result = sdk_client.create_payment_link(
            amount_inr=arguments["amount_inr"],
            description=arguments.get("description", "Order payment"),
        )
        return {"_path": "sdk_fallback", "_mcp_error": error, "raw": result}

    if tool_name == "fetch_payment":
        result = sdk_client.fetch_payment(arguments["payment_id"])
        return {"_path": "sdk_fallback", "_mcp_error": error, "raw": result}

    raise RuntimeError(f"No SDK fallback implemented for tool '{tool_name}': {error}")