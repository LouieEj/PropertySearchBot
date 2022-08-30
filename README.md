# PropertySearchBot

Bot which retrieves properties from Rightmove and sends them in to a Discord server's channel named "properties".

## SETUP
First, create a channel in your server called properties (make sure it is lower-case), otherwise the bot will not work.

After that, you can add the bot to your server with this link: https://discord.com/api/oauth2/authorize?client_id=1014172898887471126&permissions=8&scope=bot


## CONFIGURE
The bot works by going to the webpage from a URL the user must provide. Once at that webpage, the bot gets the information of any new properties and sends it in to the "properties" channel.

The reason why a URL has to be used is explained further below in the LIMITATIONS section.

By default, the URL is set to look for properties with 2-3 bedrooms in Shipley.

To change this, you first need to go to Rightmove's website yourself and search for properties to rent: https://www.rightmove.co.uk/property-to-rent.html
Enter a postcode or area, apply all the filters you want, and **make sure Sort: Newest Listed is selected (IMPORTANT).**
After this, copy the URL of the Rightmove webpage, and then go back to the Discord server with the bot in.

To change the URL the bot fetches data from, you must use a command:

> !update rightmove *url*

Replace *url* with the URL you copy and pasted.
Example:
> !update rightmove https://www.rightmove.co.uk/property-to-rent/find.html?locationIdentifier=REGION%5E198&maxBedrooms=8&minBedrooms=3&propertyTypes=&includeLetAgreed=false&mustHave=&dontShow=&furnishTypes=&keywords=


## COMMANDS
The bot uses the ! prefix before any command.

All commands can be found by calling the !help command.


### LIMITATIONS
The main limitation of the bot is that the user has to manually copy-and-paste a URL from a search query on Rightmove's website, which is a bit tedious. This is because Rightmove has its own form of coding for Postcodes, Regions, and Areas. This means that programatically the URL can't be changed to suit the required location a user wants. This is better explained with an example:

- I search for a property in Shipley on Rightmove.
- Rightmove converts my search query in to a Region code -- the region code generated by Rightmove for Shipley is REGION%5E1204.
- Rightmove finds properties using that region code.

Without using a URL the program would have to rely on a database of all possible Postcode, Region, and Area codes which Rightmove stores, which would be incredibly slow to search, and may change over time which would cause issues with maintaining the bot.

Due to all these reasons, the bot requires the user to manually copy-and-paste a URL, as other methods to tackle this are not feasible.
