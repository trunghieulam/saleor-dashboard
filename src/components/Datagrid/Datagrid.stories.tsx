import Decorator from "@saleor/storybook/Decorator";
import { storiesOf } from "@storybook/react";
import React from "react";

import Datagrid, { DatagridProps } from "./Datagrid";

const data = [
  {
    id: "627bd0e7476cd1000ecef6b4",
    balance: "$3,067.88",
    age: "40",
    eyeColor: "green",
    name: "Melba Keller"
  },
  {
    id: "627bd0e763eb9e68f3800b9f",
    balance: "$3,523.57",
    age: "39",
    eyeColor: "green",
    name: "Dixie Rivera"
  },
  {
    id: "627bd0e785b17c7a9b406c62",
    balance: "$3,240.22",
    age: "38",
    eyeColor: "brown",
    name: "Lamb Clayton"
  },
  {
    id: "627bd0e7c6460044c736e00a",
    balance: "$3,450.59",
    age: "30",
    eyeColor: "blue",
    name: "Charity Mcgee"
  },
  {
    id: "627bd0e77792e92a1b00d09c",
    balance: "$3,196.74",
    age: "39",
    eyeColor: "brown",
    name: "Ward Hayden"
  },
  {
    id: "627bd0e78ff0fc7e94570ecd",
    balance: "$2,222.02",
    age: "30",
    eyeColor: "blue",
    name: "Emily Parrish"
  },
  {
    id: "627bd0e7d0b1a0050a83619b",
    balance: "$3,558.55",
    age: "37",
    eyeColor: "blue",
    name: "Wood Hensley"
  },
  {
    id: "627bd0e7138637a41c457158",
    balance: "$1,955.85",
    age: "29",
    eyeColor: "green",
    name: "Karin Cote"
  },
  {
    id: "627bd0e7c3502435bc459efe",
    balance: "$2,358.54",
    age: "37",
    eyeColor: "green",
    name: "Roberta Rollins"
  },
  {
    id: "627bd0e7da2e10b6154b85cf",
    balance: "$2,048.10",
    age: "26",
    eyeColor: "green",
    name: "Francis Talley"
  }
];

const props: DatagridProps<Record<
  "id" | "name" | "balance" | "age" | "eyeColor",
  string
>> = {
  availableColumns: [
    { label: "ID", value: "id" },
    { label: "Name", value: "name" },
    { label: "Balance", value: "balance" },
    { label: "Eye color", value: "eyeColor" },
    { label: "Age", value: "age" }
  ],
  data,
  getData: (data, column) => ({
    id: data.id,
    value: data[column]?.toString() ?? "",
    column
  }),
  menuItems: () => [
    {
      label: "Do something",
      onSelect: () => undefined
    }
  ]
};

storiesOf("Generics / Datagrid", module)
  .addDecorator(Decorator)
  .add("default", () => (
    <div style={{ width: 800, margin: "auto" }}>
      <Datagrid {...props} />
    </div>
  ));
