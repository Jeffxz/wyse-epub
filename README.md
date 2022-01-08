# wyse

A CLI tool to generate epub from html website

## Install & Update

If you have nodejs installed in your local then all you needed is to run

```
npm install -g wyse
```

## Convert Local Website

Have your website ready (some folder with index.html or entry (x)html file)

Step 1. If it's first time you can run following command to initialize the folder
```
wyse init .
```

Step 2. Once you have wyse.json you can modify each field and add uniqueIdentifier in the file

Step 3. Now you can run following command to generate epub metadata in the folder

```
wyse create-epub -f .
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
