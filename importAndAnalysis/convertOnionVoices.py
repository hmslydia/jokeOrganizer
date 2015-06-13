import json
import csv
import os
import pprint

#/Users/hmslydia/workspace/tutorial/onionVoices.json
joke_sub_dir = '/Users/hmslydia/workspace/tutorial'
joke_file = 'onionVoices.json'
out_file = '../server/voices.js'
#pp = pprint.PrettyPrinter(indent=4)


with open( os.path.join(joke_sub_dir, joke_file) ) as json_data:
    json_data = json.load(json_data)
    #json_data.close()
    
    out_js = open(out_file, 'w')
    out_js.write('voices = ')
    out_js.write(json.dumps(json_data))
    #print(json_data)



