---
title: "Fix YAML front matter bug in add command"
is_done: true
---

Update the createTaskContent function in add.ts to properly quote titles in YAML front matter, especially when they contain special characters like colons
