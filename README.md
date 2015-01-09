# subwave

A static blog generator using JavaScript and Node in the spirit of Octopress/Jekyll and Cryogen. I keep almost getting into describe what a 'static blog generator' means but I figure if you've gotten here you either know what that means already or you're a friend of mine and you don't care anyway. 

subwave is _almost_ at a beta stage. I use it for my [blog](http://www.backedupsomewhere.com) and it's pretty solid but it's not there yet.

### Current Features
* Quickly create new posts with `subwave new`
* Builds with `subwave build`
* Deploys easily `subwave deploy`
* Multiple posts and pages can be added at once
* Different post types (e.g., post, link, and photo)
* Easy user configuration
* Post tagging
* Markdown support
* Syntax highlighting
* RSS feed
* Post excerpts
* Bootstrap styling
* Jade templates

### Upcoming Features
In no particular order:
* Textile support
* Post previews
* Post/Page subtitles
* Deleting posts
* Site auditing
* Multiple authors
* Marking posts as favorites

### Current Features
* Quickly create new posts with `subwave new`
* Builds with `subwave build`
* Deploys easily `subwave deploy`
* Multiple posts and pages can be added at once
* Different post types
* Easy user configuration
* Post tagging
* Markdown support
* Syntax highlighting
* RSS feed
* Post excerpts
* Bootstrap styling
* Jade templates

### Upcoming Features
In no particular order:
* Textile support
* Post previews
* Post/Page subtitles
* Deleting posts
* Site auditing
* Multiple authors
* Marking posts as favorites

## Installation

There isn't one.

The way I do it is I've cloned my own repo to another directory, created a git branch off of that called `blog` and I do all of my blogging and customization from there.

## Usage

Where do I even begin. Most easily, `subwave new-post` generates a text file in `resources/inbox`. The metadata here is what's important:

	{
		"type": "post",
		"id": "c0f6261-13db-417c-a6fa-0075bf4c9cb8",
		"title": "Have you ever done the Kenosha Kid?",
		"author": "Thomas Pynchon",
		"date": "2015-01-08 22:15",
		"tags": ["Gravity's Rainbow", "@GuyInYourMFA"]
	}

You don't need `new-post`, technically. You can just type this out all by hand except for the id. You can get that with `subwave gen-id` or just create a file with required JSON and submit it to subwave who will so it has no ID and attributes one accordingly.

Snazzy.

So a file is the above JSON followed by one or more linefeed and whatever the heck else you want. This is otherwise known as the body of the post. Change the type and you get a different kind of post. Currently I have post, link, and minipost. It's fairly easy to add new post types and will get easier. Eventually, it'll be simply a matter of updating the configuration file.

Meanwhile, you can customize the site layout by editing the files in resources/templates and resources/css. The templates are in Jade but it's fairly straightforward. Custom images and JavaScript go into resources/img and js respectively.

To upload the site to a remote server, add the necessary command line to the configuration file. My current method is:

	rsync --verbose  --progress --stats --compress --rsh=/usr/bin/ssh --recursive --times --perms --links --delete public/* user@remote-site.com:remote-dir

Typing `subwave publish` simply evokes that command line and, boop, up goes my dumb blog.

### UH PARTY AT THE LIGHT TOWER

So basically, as you can see, it's not all the way there yet. The code's solid and it all works but it's not user-friendly. That comes next and/or last aat least until I get up to a beta version. Hell, I'm not even putting version numbers on this thing yet. That'll be soon. I'm _almost_ there. 

## What's It Look Like in Action?

My brand-new-still-has-the-fresh-bits-stank-on-it site is [here](http://www.backedupsomewhere.com). The layout is customized off of [Yeti](http://bootswatch.com/yeti/). It's currently designed to look like just about every other homebrewed tech blog out there so as not to frighten people off or cause things to burst into flames for no reason. I expect future sprucage. It's safe to say the caffeine has kicked in right as I was typing this paragraph.

## Built with Joy Featuring

* [Bootstrap](http://www.getbootstrap.com)
* [Jade](http://jade-lang.com)
* [commander](https://www.npmjs.com/package/commander)
* [marked](https://www.npmjs.com/package/marked)
* [rss](https://www.npmjs.com/package/rss)
* [Grunt](http://gruntjs.com/)
* [Mocha](http://mochajs.org/)
* [Chai](http://chaijs.com)

## License

Copyright © 2014 Akiva Schoen

Distributed under the Eclipse Public License either version 1.0 or any later version.
