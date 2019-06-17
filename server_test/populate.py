from base import *
init("http://localhost:8000")
simple_login()

import time

from faker import Faker
fake = Faker()

curmt = lambda: int(round(time.time() * 1000))

for x in range(0,5000):
	url = fake.url(schemes=None)
	title = fake.catch_phrase()
	desc = fake.paragraph(nb_sentences=3, variable_nb_sentences=True, ext_word_list=None)
	tags = []
	for y in range(0,5):
		tags.append(fake.safe_color_name())
	tags = list(dict.fromkeys(tags))

	ms1 = curmt()
	notes_create(title,desc,url,tags)
	ms2 = curmt()
	print(x, " Create took :",(ms2-ms1)) 
	
	time.sleep(0.05)

ms1 = curmt()
notes_all(fm=100000,ps=100)
ms2 = curmt()
print("100 download took ", (ms2-ms1))
