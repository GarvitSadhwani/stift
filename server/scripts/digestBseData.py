import csv
import json

def csv_to_json(csv_file, json_file):
    with open(csv_file, 'r') as csv_input:
        csv_reader = csv.reader(csv_input)
        
        headers = next(csv_reader)
        
        with open(json_file, 'w') as json_output:
            json_output.write('[')
            for row in csv_reader:
                row_dict = {}
                row_dict["name"]=row[1]
                row_dict["symbol"]=row[2]
                row_dict["industry"]=row[8]
                
                json.dump(row_dict, json_output)
                json_output.write(',\n')  
            json_output.write(']')

csv_to_json('Equity.csv', '../files/bsedata.json')

print("Data Digested.")
