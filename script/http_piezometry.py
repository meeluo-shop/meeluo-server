import time
import json
import random
from urllib.error import URLError
from urllib import request
import http.client
import requests
import gevent
from gevent import monkey
# 补丁
monkey.patch_all()

headers = {
  'Content-Type': "application/json",
  'Accept': "application/json",
  'User-Agent': 'Mozilla/5.0 (Windows NT 6.1;WOW64; rv:45.0) Gecko/20100101 Firefox/45.0',
  'Admin-Token': 'ZXlKcmFXUWlPaUl3SWl3aWRIbHdJam9pU2xkVUlpd2lZV3huSWpvaVNGTXlOVFlpZlEuZXlKcFlYUWlPakUxT1RBMU56UXpOREVzSW5OMVlpSTZJbXh2WjJsdUlpd2lhWE56SWpvaWQyVmtjeUlzSW1WNGNDSTZNVGMwTmpBNU5ETTBNU3dpY0dGc1p5STZJbUZsY3kweU5UWXRZMkpqSWl3aWNHdGxlV2xrSWpvaU1TSXNJbXAwYVNJNklqTXlNalV6TTNkbFlteHZaMmx1SWl3aVlYVmtJam9pZDJWaUlpd2ljR1JoZEdFaU9pSTRNelpsTlRZMU1UTXpaRGMwTlRReU5USmhNV0l3TWpRek56Z3lOalV5Tm1NelpqWTNObVUwT0RFeU1UbGxOVFEzWldRMlpUTm1NVFEwWlRZNVlqWmtNbVJsTWpneE56ZzNPRGN6WXpCbVlXUXdPREJrWldSak5XSXlZalkwTVRkbVltUTJNRGsxWm1aak5tWTNOalUyTkdRNU9HRm1NR0pqWVRWaE4yWXhNVEpoWWpGaU5tSXpPVEV6TlRRMk9HVmhOVGczWkRSbE1ETTRNbUZqWTJabU16bGtZMkk1WlRFNFlUbGhOakJpTXpCak0ySmlZalF3TmpFeE9URmlOVGhoWVROalpqaG1ZekZoWWpRNE0yUmlaamRtWkRjeE9XTTBPV1V5TlRZMFpqTmhPV0UyWVRGbU5ETXpPVFUyWlRjd1kyWTJPR0V6WlRKbFl6WXlOams1SW4wLklyeFFINmZsckcwWXdOakZ1MVR6bE90VlA5WG02NEY1TlNNS0ZHRUtGbGM='
}

data = {
  "username": "string",
  "password": "string",
  "encrypt": 1
}

body = {"operationName":None,"variables":{},"query":"{\n  authors(where: {name: {equals: \"iim\"}}) {\n    name\n  }\n}\n"}

total_time = 0

request_id = 0

def run():
  global total_time
  global request_id
  try:
    request_id += 1
    headers['Request-Context-Id'] = str(request_id)
    headers['Admin-Token'] = str(request_id)
    begin_time = time.time()
    # resp = requests.post(url='http://localhost:3001/api/admin/passport/login', data=json.dumps(data), headers=headers)
    resp = requests.post(url='http://localhost:3001/graphql', data=json.dumps(body), headers=headers)
    end = time.time()
    exce_time = (end - begin_time) * 1000
    total_time += exce_time
    print("(" + str(exce_time) + ")服务器返回值为:\n", resp.content.decode())

  except URLError as e:
    print('请求', e)
  except Exception as e:
    print('请求错误：', e)

def call_gevent(count):
  """调用gevent 模拟高并发"""
  run_gevent_list = []
  for i in range(count):
    print('--------------%d--Test-------------' % i)
    run_gevent_list.append(gevent.spawn(run))
  gevent.joinall(run_gevent_list)
  print('单次测试时间（平均）ms:', (total_time / count))
  print('累计测试时间 ms:', total_time)


if __name__ == '__main__':
  test_count = 20
  call_gevent(count=test_count)