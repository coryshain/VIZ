VIZ is a web-based presentation format for searching
course requirements by program and program requirements
by course. It is written in HTML, CSS, and Javascript,
and all data loading, searching, and user interface
behavior is handled by the browser, requiring very few
resources from the server.

This directory also contains VIZ Builder, a GUI for
managing the database used by VIZ to display course
requirements. VIZ Builder allows admistrators a great
deal of freedom in customizing the information displayed
in VIZ, as well as some control over display parameters
like color and logo. VIZ Builder allows non-technical
users to easily manage and update VIZ.

Since VIZ automatically generates its user interface
based on data provided by the content creator, VIZ
can be customized and deployed by any academic unit
at any institution wishing to communicate this kind
of curricular information to their students.

Installing VIZ is simple:

1. Clone or copy this directory to the desired location
on your web server.
2. Install the required third-party components:
- Skeleton (http://getskeleton.com/)
-- Extract Skeleton-2.0.4 to your VIZ directory root
- FileSaver (https://github.com/eligrey/FileSaver.js/)
-- Copy FileSaver.min.js to the /js folder of your
VIZ directory
3. Build your database using VIZ Builder

VIZ distributes with a correctly-structured blank
database file (vizDB.txt). A blank database can be
generated at any time from VIZ Builder by selecting
"Start New Database" and immediately downloading the
current database.

The content of the database is simple JSON, but manual editing
is discouraged because of the potential for error. While
VIZ Builder does have some data verification features for
uploaded database files, neither VIZ Builder or VIZ itself
verify the database already existing on the server, and errors
in it can break functionality in both tools. Database output
from VIZ Builder should always be correct if it is provided
with a correctly-structured input database. For this reason,
it is strongly encouraged to use VIZ Builder exclusively to make
edits to the database, rather than manual editing.
