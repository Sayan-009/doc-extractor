from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
import asyncio

async def append_to_sheet(creds_data: dict, spreadsheet_id: str, range_name: str, values: list):
    def _append():
        creds = Credentials(**creds_data)
        service = build('sheets', 'v4', credentials=creds)
        body = {'values': values}
        result = service.spreadsheets().values().append(
            spreadsheetId=spreadsheet_id, range=range_name,
            valueInputOption='USER_ENTERED', body=body).execute()
        return result
    
    return await asyncio.to_thread(_append)
