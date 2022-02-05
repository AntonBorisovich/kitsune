#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import sys
import json
from getpass import getpass
from sys import platform
import mesh

RUNTIME_ARGS = {
	"debug": False,
}


def display_answers(link):
	answers = mesh.get_answers(link)
	if platform == "win32":
		for task_number, task in enumerate(answers):
			print("ХУЙГОВНО**Вопрос %d:** %s".encode('utf-8').decode('ANSI') % (task_number + 1, task [0].replace('И', 'и').encode('utf-8').decode('ANSI')))
			print("HOMOSEC %s".encode('utf-8').decode('ANSI') % task [1].replace('И', 'и').encode('utf-8').decode('ANSI'))
	else:
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
