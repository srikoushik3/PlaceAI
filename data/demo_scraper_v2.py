from urllib.request import urlopen
from bs4 import BeautifulSoup
import csv
from datetime import datetime
import re

# 3 components of the statistics Canada website
firstpart = 'https://www12.statcan.gc.ca/census-recensement/2016/dp-pd/prof/details/page.cfm?Lang=E&Geo1=FSA&Code1='
secondpart = '&Geo2=PR&Code2=01&Data=Count&SearchText='
thirdpart = '&SearchType=Begins&SearchPR=01&B1=All&TABID=2'

urls = []
postal_codes = []

with open('postal_code_data.csv') as csv_file:
    csv_reader = csv.reader(csv_file, delimiter=",")
    line_count = 0
    for row in csv_reader:
        #if row[1][:0] != 'M' or row[1][:1] != 'm':
        #    urls.append('')
        #else:
        urls.append(firstpart + row[1]  + secondpart + row[1] + thirdpart)
        postal_codes.append(row[1])
        line_count += 1

data = []

del urls[0]
for page in urls:
    print(page)


with open('ontario_demographics.csv', 'a') as csv_file:
    writer = csv.writer(csv_file)
    index = 0
    for page, pcode in zip(urls, postal_codes):
        try:
            opened_page = urlopen(page)
            soup = BeautifulSoup(opened_page, 'html.parser')
            age_box = soup.find('td', attrs={'headers':'L2032 geo1 total1'})
            income_box = soup.find('td', attrs={'headers':'L12004 geo1 total1'})

            couples_without_children = soup.find('td', attrs={'headers':'L5014 geo1 total1'}).text.strip()

            couples_with_children = soup.find('td', attrs = {'headers':'L5015 geo1 total1'}).text.strip()
            lone_parents_with_children = soup.find('td', attrs={'headers':'L5019 geo1 total1'}).text.strip()

            couples_one_child = soup.find('td', attrs = {'headers':'L5016 geo1 total1'}).text.strip()
            couples_two_children = soup.find('td', attrs = {'headers':'L5017 geo1 total1'}).text.strip()
            couples_three_children = soup.find('td', attrs = {'headers':'L5018 geo1 total1'}).text.strip()
            single_one_child = soup.find('td', attrs = {'headers':'L5020 geo1 total1'}).text.strip()
            single_two_children = soup.find('td', attrs = {'headers':'L5021 geo1 total1'}).text.strip()
            single_three_children = soup.find('td', attrs = {'headers':'L5021 geo1 total1'}).text.strip()

            youth_ratio = soup.find('td', attrs = {'headers':'L2028 geo1 total1'}).text.strip()


            couples_without_children = int(couples_without_children.replace(',', ''))
            couples_with_children = int(couples_with_children.replace(',', ''))
            lone_parents_with_children = int(lone_parents_with_children.replace(',', ''))

            couples_one_child = int(couples_one_child.replace(',', ''))
            couples_two_children = int(couples_two_children.replace(',', ''))
            couples_three_children = int(couples_three_children.replace(',', ''))
            single_one_child = int(single_one_child.replace(',', ''))
            single_two_children = int(single_two_children.replace(',', ''))
            single_three_children = int(single_three_children.replace(',', ''))

            age = age_box.text.strip()
            income = income_box.text.strip()
            age = age.replace(',', '')
            income = int(income.replace(',', ''))
            ratio = (single_one_child+2*single_two_children+4*single_three_children+couples_one_child+2*couples_two_children+3*couples_three_children)/(2*couples_with_children+lone_parents_with_children)
            writer.writerow((age, income, ratio, youth_ratio, pcode))

            print(str(index) + '/' + str(len(urls)))
            index += 1

        except Exception as e:
            writer.writerow(" ")
            print(" ")
