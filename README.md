# subwave

A static blog generator using JavaScript ind Node n the spirit of Octopress/Jekyll and Cryogen.

## Installation

Clone and examine. Proper documentation coming very soon. Probably this weekend. Maybe even later today. WHO KNOWS? I'M CAPRICIOUS. Until then:

## Usage

Get help with `subwave --help` but the basics are `subwave new 'post'` to create new entries and `subwave new 'page'` to create new pages like About. Build the site with `subwave build`.

Customize the site layout by editing the files in resources/templates and resources/css. The templates are in Jade but it's fairly straightforward. Custom images and JavaScript go into resources/img and js respectively.

To upload the site to a remote server, I use the following:

`rsync --verbose  --progress --stats --compress --rsh=/usr/bin/ssh --recursive --times --perms --links --delete public/* user@remote-site.com:remote-dir`

## What's Next?

Make this more user-friendly. It's pretty close to being a decent OOBE experience but there are a few things missing like `subwave init`.

## What's It Look Like in Action?

My brand-new-still-has-the-fresh-bits-stank-on-it site is [here](http://www.backedupsomewhere.com). It's customized off of [Yeti](http://bootswatch.com/yeti/).

## License

Copyright © 2014 Akiva Schoen

Distributed under the Eclipse Public License either version 1.0 or any later version.
