# उपयोग: python lgd_to_json.py lgd_villages.csv
# LGD की CSV में राज्य, ज़िला, तहसील, गाँव के कॉलम होने चाहिए। नीचे कॉलम-नाम अपनी फ़ाइल के हेडर से मिलाकर बदल लें।
import csv, json, sys, os
COLS = {"state": "State Name (In English)", "district": "District Name (In English)",
        "tehsil": "Sub-District Name (In English)", "village": "Village Name (In English)"}
CODES = {"ANDHRA PRADESH":"AP","ARUNACHAL PRADESH":"AR","ASSAM":"AS","BIHAR":"BR","CHHATTISGARH":"CG","GOA":"GA",
"GUJARAT":"GJ","HARYANA":"HR","HIMACHAL PRADESH":"HP","JHARKHAND":"JH","KARNATAKA":"KA","KERALA":"KL",
"MADHYA PRADESH":"MP","MAHARASHTRA":"MH","MANIPUR":"MN","MEGHALAYA":"ML","MIZORAM":"MZ","NAGALAND":"NL",
"ODISHA":"OD","PUNJAB":"PB","RAJASTHAN":"RJ","SIKKIM":"SK","TAMIL NADU":"TN","TELANGANA":"TS","TRIPURA":"TR",
"UTTAR PRADESH":"UP","UTTARAKHAND":"UK","WEST BENGAL":"WB","ANDAMAN AND NICOBAR ISLANDS":"AN","CHANDIGARH":"CH",
"THE DADRA AND NAGAR HAVELI AND DAMAN AND DIU":"DN","DELHI":"DL","JAMMU AND KASHMIR":"JK","LADAKH":"LA",
"LAKSHADWEEP":"LD","PUDUCHERRY":"PY"}
out = {}
with open(sys.argv[1], encoding="utf-8-sig", newline="") as f:
    for r in csv.DictReader(f):
        code = CODES.get(r[COLS["state"]].strip().upper())
        if not code: continue
        t = out.setdefault(code, {}).setdefault(r[COLS["district"]].strip().title(), {})
        t.setdefault(r[COLS["tehsil"]].strip().title(), []).append(r[COLS["village"]].strip().title())
os.makedirs("data", exist_ok=True)
for code, d in out.items():
    with open(f"data/{code}.json", "w", encoding="utf-8") as g:
        json.dump(d, g, ensure_ascii=False, separators=(",", ":"))
    print(code, "तैयार")
