# FullBlownAinz.com canonical source

This `original-live` checkout is the authoritative source for the production
FullBlownAinz.com website and for all future edits to that site.

Do not deploy `Z:\Codey\FBA APPs\FBA.COM\root` to the `fbadotcom` Netlify
project. That directory contains an incomplete reworked version of the site.

The parent domain owns only the routing mounts for FBA.LINK, Smosh-O-Matic,
Trek-O-Matic, and Thrones-O-Matic. Those applications remain independently
deployed and are mounted through the rewrites in `netlify.toml`.
