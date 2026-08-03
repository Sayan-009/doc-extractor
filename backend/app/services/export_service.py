import csv
import io

async def generate_csv_from_rows(extracted_rows: list) -> str:
    if not extracted_rows:
        return ""
    
    # Assuming extracted_rows is a list of dictionaries (from DB models)
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=extracted_rows[0].keys())
    writer.writeheader()
    writer.writerows(extracted_rows)
    return output.getvalue()
