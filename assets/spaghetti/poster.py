import ftplib
import os
import shelve
from alert import send_alert
import praw
import pyimgur
import discord


def discord_post():
    discord_token = 'DISCORD TOKEN'
    discord_client = discord.Client()

    try:
        @discord_client.event
        async def on_ready():
            await discord_client.change_presence(game=discord.Game(name="Spaghettifying Images"))
            await discord_client.send_file(discord.Object(id='DISCORD SERVER'), image_path)
            await discord_client.logout()


        discord_client.run(discord_token)
    except Exception:
        print('Discord error')
		raise


def main():
    global image_path
    global source_path
    global post_number

    s = shelve.open("data")
    is_new_day = s.get("new_day")
    print(is_new_day)
    if is_new_day:
        number_posted = int(s.get("first_image_number"))
        s["new_day"] = False
        post_number = number_posted
    else:
        try:
            number_posted = int(s.get("number_posted"))
        except TypeError:
            send_alert(str(e))
        # if number_posted is None:
        #   number_posted =
        print(number_posted)
        post_number = number_posted + 1

    day_number = int(s.get("day_number"))
    day_folder_upscaled = os.path.join(spaghetti_bot_path, "NEWdoneupscaled" + str(day_number))
    original_folder = os.path.join(spaghetti_bot_path, "original" + str(day_number))

    image_path = os.path.join(day_folder_upscaled, str(post_number) + ".jpg")
    source_path = os.path.join(original_folder, str(post_number) + ".jpg")
    print(image_path)
    print(source_path)
    print("Day " + str(day_number))
    print("Post " + str(post_number))

    try:
        discord_post()
    except Exception as e:
        print(e)
        send_alert(str(e))
        raise

    s["number_posted"] = post_number
    s.close()

if __name__ == '__main__':
    spaghetti_bot_path = "./images"
    main()