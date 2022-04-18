Have your website ready (some folder with index.html or entry (x)html file)

Step 1. If it's first time you can run following command to initialize the folder
```
wyse init .
```

Step 2. Once you have wyse.json you can modify each field and add uniqueIdentifier in the file

Step 3. Now you can run following command to generate epub metadata in the folder

```
wyse init-epub -f .
```

Step 4. package the folder to epub file with following command

Following command is for Mac. You might need to run other command if not using mac environment.

```
wyse pack .
```

## Convert Local Markdown

```
wyse markdown <markdown file>
```

## Convert Local text file

```
wyse text <text file>
```
