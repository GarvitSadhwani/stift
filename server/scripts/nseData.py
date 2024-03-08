import requests
import json
import pandas as pd
from datetime import datetime,timedelta,timezone
from nsetools import Nse
from io import BytesIO
import psycopg2

class NSE():
    def __init__(self, timeout=10):
        self.base_url = 'https://www.nseindia.com'
        self.session = requests.sessions.Session()
        self.session.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36 Edg/97.0.1072.55",
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
            "accept-language": "en-US,en;q=0.9"
        }
        self.timeout = timeout
        try:
            response = self.session.get(self.base_url, timeout=self.timeout)
            print("Request status code:", response.status_code)
            print("Response headers:")
            for key, value in response.headers.items():
                print(f"{key}: {value}")
            print("Response content (first 100 characters):")
            print(response.text[:100])
        except requests.exceptions.RequestException as e:
            print("An error occurred:", e)
        #self.cookies = []
    '''
    def __getCookies(self, renew=False):
        if len(self.cookies) > 0 and renew == False:
            return self.cookies

        r = requests.get(self.base_url, timeout=self.timeout, headers=self.headers)
        self.cookies = dict(r.cookies)
        return self.__getCookies()
    '''
    def getHistoricalData(self, symbol, from_date, to_date):
        try:
            #url = "/api/historical/cm/equity?symbol={0}&series=[%22{1}%22]&from={2}&to={3}&csv=true".format(symbol.replace('&', '%26'), series, from_date.strftime('%d-%m-%Y'), to_date.strftime('%d-%m-%Y'))
            #r = self.session.get(self.base_url + url, timeout=self.timeout)
            url='https://query2.finance.yahoo.com/v8/finance/chart/'+symbol+'.BO?formatted=true&crumb=kJzbrRThriu&lang=en-US&region=US&includeAdjustedClose=false&interval=1d&period1='+str(from_date)+'&period2='+str(to_date)+'&events=capitalGain%7Cdiv%7Csplit&useYfid=true'
            r = self.session.get(url, timeout=self.timeout)
            #df = pd.read_csv(BytesIO(r.content), sep=',', thousands=',')
            #df = df.rename(columns={'Date ': 'date', 'series ': 'series', 'OPEN ': 'open', 'HIGH ': 'high', 'LOW ': 'low', 'PREV. CLOSE ': 'prev_close', 'ltp ': 'ltp', 'close ': 'close', '52W H ': 'hi_52_wk', '52W L ': 'lo_52_wk', 'VOLUME ': 'trdqty', 'VALUE ': 'trdval', 'No of trades ': 'trades'})
            #df.date = pd.to_datetime(df.date).dt.strftime('%Y-%m-%d')
            return r.json()
        except:
            print("not found: ",symbol)
            return None

    def fetch_index_from_nse(self, index_symbol):
        df = []
        res = self.session.get(self.base_url + '/api/equity-stockIndices?index=' + index_symbol, timeout=10)
        if res.status_code == 200:
            res_json = res.json()
            if 'data' in res_json:
                df = pd.json_normalize(res_json['data'])
            else:
                print('Data not returned from NSE')
                print(res_json)
        else:
            print('HTTP Request Failed: ')
            print(res)
        
        return df

    def save_index_to_csv(self, index_symbol, csv_file_name=None, delimiter=',', index=True, header=True):
        if csv_file_name == None:
            csv_file_name = index_symbol + '.csv'

        df = self.fetch_index_from_nse(index_symbol)
        if len(df) > 0:
            df.to_csv(csv_file_name, sep=delimiter, index=index, header=header)
            return True
        
        return False
    

if __name__ == '__main__':
    nseObj = NSE()
    nse = Nse()
    today_date = datetime.today().date() +timedelta(days=1)
    today_timestamp = int((today_date - datetime(1970, 1, 1).date()).total_seconds())
    old_date=today_date-timedelta(days=700)
    old_timestamp = int((old_date - datetime(1970, 1, 1).date()).total_seconds())

    conn = psycopg2.connect(
        dbname="postgres",
        user="stift",
        password="stiftdb",
        host="localhost",
        port="5432"
    )
    cursor = conn.cursor()
    cursor.execute("DELETE FROM stockcache")

    with open('../files/bsedata.json','r') as stockSymbols:
        print("getting historical data")
        stockSymbolJson=json.load(stockSymbols)
        for stock in stockSymbolJson["0"]:
            #df = nseObj.getHistoricalData(stock["symbol"], 'EQ', date_200_days_ago, today_date)
            df = nseObj.getHistoricalData(stock["symbol"], old_timestamp, today_timestamp)
            
            #selected_columns = ['date','open','high','low','close']  # Replace these numbers with the actual column indices you want to keep
            #df_selected=df[selected_columns]
            #data_list = df_selected.to_dict(orient='records')

            if df==None:
                continue
            if df["chart"]["result"]==None:
                continue
            
            data_list=df["chart"]["result"][0]["indicators"]
            if "quote" in data_list and "close" in data_list["quote"][0]:
                closeArr=data_list["quote"][0]["close"]
            else:
                continue

            if len(closeArr)<2 or closeArr[-1]==None or closeArr[-2]==None :
                continue
            
            perChange=((closeArr[-1]-closeArr[-2])/closeArr[-2])*100
            curClose=closeArr[-1]

            if len(data_list)==0:
                print("not found: ",stock["symbol"])
                continue
            cursor.execute("INSERT INTO stockcache(close, change, symbol) VALUES(%s,%s,%s)",(curClose,perChange,stock["symbol"]))
            with open('../stocks/'+stock["symbol"]+'.json', 'w') as json_file:
                json.dump(data_list, json_file,indent=2)
            print("saved: ",stock["symbol"])
    
    conn.commit()
    cursor.close()
    conn.close()
    