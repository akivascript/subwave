# subwave

A static blog generator using JavaScript and Node in the spirit of Octopress/Jekyll and Cryogen.

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

Clone and examine. Proper documentation coming very soon. Probably this weekend. Maybe even later today. WHO KNOWS? I'M CAPRICIOUS. Until then:

## Usage

Get help with `subwave --help` but the basics are `subwave new 'post'` to create new entries and `subwave new 'page'` to create new pages like About. Build the site with `subwave build`.

Customize the site layout by editing the files in resources/templates and resources/css. The templates are in Jade but it's fairly straightforward. Custom images and JavaScript go into resources/img and js respectively.

To upload the site to a remote server, I use the following:

	rsync --verbose  --progress --stats --compress --rsh=/usr/bin/ssh --recursive --times --perms --links --delete public/* user@remote-site.com:remote-dir

## What's Next?

Make this more user-friendly. It's pretty close to being a decent OOBE experience but there are a few things missing like an easily-modified configuration file, `subwave init` to get a new site up and running quickly, and I'd like to add something like `subwave deploy` so you don't need to run `rsync` by hand. Also, fewer lens flares.

## What's It Look Like in Action?

My brand-new-still-has-the-fresh-bits-stank-on-it site is [here](http://www.backedupsomewhere.com). The layout is customized off of [Yeti](http://bootswatch.com/yeti/). It's currently designed to look like just about every other homebrewed tech blog out there so as not to frighten people off or cause things to burst into flames for no reason. I expect future sprucage. It's safe to say the caffeine has kicked in right as I was typing this paragraph.

## Built With Joy Featuring

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
