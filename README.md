# Emu

## What is Emu?
#### Easily Maintained Client-Side URL Rewriter or Emu for short

## How does Emu work

Emu is split into two parts, the first part is concerned with identification of Web IDL interfaces and the second part is concerned with generating JavaScript code for client-side rewriters.

The identification portion of Emu is configured to look for Web IDL interfaces that use URLs
and to find other interfaces that have identified interfaces as attributes.


The code generation portion progressively builds the AST of the to be generated code.

Code generation uses babel (babel-types, babel-generator) as it provides syntax checking each time a part of the AST is built and when the code is to be generated will generate syntactically correct code.
