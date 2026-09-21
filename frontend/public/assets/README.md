# Homepage assets

The supplied CAESAR logos are kept unmodified as `caesar-full.png` and `caesar-mark.png`.

`caesar-rocket.png` is the user's supplied 1024 × 1536 PNG, copied unchanged from
`ChatGPT Image Sep 16, 2026, 09_34_01 PM.png`. The cinematic homepage uses this
asset, with uniform CSS transforms preserving its exact 2:3 aspect ratio.
The original Phobos render remains in the project section.

Existing CAESAR assets downloaded on 2026-09-16:

| Local file | Original source |
| --- | --- |
| launch.png | https://caesar.se/wp-content/uploads/2022/01/cropped-11704689944_768d897db1_o.png |
| team.jpeg | https://caesar.se/wp-content/uploads/2026/03/20260211_TeamPhoto_7-1024x640-1.jpeg |
| phobos.png | https://caesar.se/wp-content/uploads/2026/02/phobos-1536x960-1-1024x640.png |
| chalmers.png | https://caesar.se/wp-content/uploads/2022/02/AvancezChalmers_black_right.png |
| astronomisk-ungdom.png | https://caesar.se/wp-content/uploads/2022/10/au_logga_ny-1024x352.png |
| tranemo.png | https://caesar.se/wp-content/uploads/2023/07/Tranemo_logo_BLACK_tagline-1024x416.png |

`launch.png` is the original website's Earth-horizon artwork, not a launch photograph.
This artwork is retained in the news grid. The original Phobos render remains
in the project showcase; the scroll experience uses the newly supplied rocket.

Inter is locally served from https://rsms.me/inter/font-files/InterVariable.woff2.
Its SIL Open Font License is included in `Inter-LICENSE.txt`.

News content and partner links are in `src/data/site.ts`. The three latest Swedish
posts were taken from CAESAR's WordPress API. They have no featured images, so
the homepage uses existing CAESAR imagery as illustrations, not event photos.
Article links retain the complete original posts. Dates have not been changed.

The original Phobos page identifies the project and displays its render but has
no detailed technical copy. The showcase therefore uses the confirmed project
status and CAESAR's existing overall mission without inventing specifications.
