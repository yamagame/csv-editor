import { factory, Fragment } from "libs/preact";

type Props = {
  title: string;
  children?: string;
};

export function Container({ title, children }: Props) {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" type="text/css" href="/index.css" />
        <title>{title}</title>
      </head>
      <body onload="main()">
        <script type="text/javascript" src="/csv-macro.js"></script>
        <script type="text/javascript" src="/csv-common.js"></script>
        {children}
      </body>
    </html>
  );
}
