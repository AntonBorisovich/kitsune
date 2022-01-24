#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import sys
import json
from getpass import getpass
import mesh

RUNTIME_ARGS = {
	"debug": False,
}


def display_answers(link):
	answers = mesh.get_answers(link)
	
	for task_number, task in enumerate(answers):
		print("ХУЙГОВНО**Вопрос %d:** %s" % (task_number + 1, task [0]))
		print("HOMOSEC %s" % task [1])


def main ():
	program_args = sys.argv
	
	if "uchebnik.mos.ru" in program_args [-1]:
		link = program_args [-1]
	else:
		print("wrong_link")
		exit()

	
	if "--info" in program_args:
		print_test_info(link)
	else:
		display_answers(link)

main()
