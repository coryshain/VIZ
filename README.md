# What is VIZ?

VIZ is a web-based presentation format for displaying relationships between courses and academic programs within an institution or department. Unlike the more familiar curriculum guides, "bingo" sheets, and degree audits (which VIZ is designed to supplement), VIZ allows users to quickly determine how broadly a course or set of courses can apply across a variety of programs under consideration. It is written in HTML, CSS, and JavaScript, and all data loading, searching, and user interface behavior is handled by the browser, requiring very few resources from the server.

This directory also contains VIZ Builder, a GUI for managing the database used by VIZ to display course requirements. VIZ Builder allows admistrators a great deal of freedom in customizing the information displayed in VIZ, as well as some control over display parameters like color and logo. VIZ Builder allows non-technical users to manage and update VIZ quickly and easily.

Since VIZ automatically generates its user interface based on data provided by the content creator, VIZ can be customized and deployed by any academic unit at any institution wishing to communicate this kind of curricular information to their students.

# Installation

Installing VIZ is simple:

1. Clone or copy this directory to the desired location on your web server.
2. Install the required third-party components:
  * Skeleton (http://getskeleton.com/)
    - Extract `Skeleton-2.0.4` to your VIZ directory root
  * FileSaver (https://github.com/eligrey/FileSaver.js/)
    - Copy `FileSaver.min.js` to the `/js` folder of your VIZ directory
3. Build your database using VIZ Builder

# Data management with VIZ Builder

## Editing and validating the database

VIZ distributes with a correctly-structured blank database file (`/data/vizDB.txt`). A blank database can be generated at any time from VIZ Builder by clicking "New" in the top menu bar, then "Start Blank Database". From there you can begin editing the database directly in VIZ Builder.

VIZ Builder has robust built-in data validation, but VIZ itself does not validate the database already existing on the server, and errors can break functionality for end users. Because data is automatically validated on load, database output from VIZ Builder is guaranteed to be well-formed (though I've included a "Validate" button for the skeptical). For this reason, I strongly encourage using VIZ Builder to make edits to the database, rather than manually editing the (JSON) data file.

## Saving changes in VIZ Builder

As the prominent disclaimer says when you first load VIZ Builder, for security reasons, changes made in VIZ Builder do not affect the database file on your website used to generate the interface for VIZ. To save changes made in VIZ Builder, click "Download" in the top menu bar, which will initiate a download of the database in its current state to your local drive. Then upload the downloaded file (`vizDB.txt`) to the `/data` directory of VIZ on your website, and your changes will be made public.

Before permanently replacing your existing database with an edited one, I suggest previewing the edited database (click "Preview" in the top menu of VIZ Builder) to make sure your changes are correct.

# Example

Live working examples of these tools include http://go.osu.edu/viz (for VIZ) and http://go.osu.edu/vizBuilder (for VIZ Builder).

To see an example of VIZ in action on your own server with a fully-developed database, upload `/example/vizDB.txt` to VIZ Builder and click "Preview".

# Support

I've made a detailed screencast for [VIZ Builder](https://youtu.be/c0g70_fBJ5w "Guided Tour of VIZ Builder") which covers its essential features. I've also made a student-facing screencast for [University Exploration at Ohio State's implementation of VIZ](https://youtu.be/NP-JnuWZoUM "Guided Tour of VIZ"), which contains OSU-specific data but adequately demonstrates the core end-user features of VIZ. For any further questions, feedback, bug reports, or feature requests, email me (Cory Shain) at shain.3@osu.edu.
