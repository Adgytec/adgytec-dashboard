import { InputHTMLAttributes, SelectHTMLAttributes } from "react";

export const regions = [
  { displayValue: "Kasaï", value: "kasai" },
  {
    displayValue: "Kasaï central",
    value: "kasai-central",
  },
  {
    displayValue: "Kasaï oriental",
    value: "kasai-oriental",
  },
  { displayValue: "Lomami", value: "lomami" },
  { displayValue: "Sankuru", value: "sankuru" },
  { displayValue: "Haut-lomami", value: "haut-lomami" },
  { displayValue: "Kwango", value: "kwango" },
  { displayValue: "Kwilu", value: "kwilu" },
  { displayValue: "Maindombe", value: "maindombe" },
  { displayValue: "Maniema", value: "maniema" },
];

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

interface InputElement extends InputProps {
  elementType: "input";
}

interface SelectElement extends SelectHTMLAttributes<HTMLSelectElement> {
  elementType: "select";
  options: {
    value: string;
    displayValue: string;
  }[];
  label: string;
}

export const priseReportsInputItems: (InputElement | SelectElement)[] = [
  {
    label: "Region",
    name: "region",
    elementType: "select",
    required: true,
    options: regions,
  },
  {
    label: "Territoire",
    placeholder: "Territoire",
    name: "Territoire",
    elementType: "input",
  },
  {
    label: "Secteur",
    placeholder: "Secteur",
    name: "Secteur",
    elementType: "input",
  },
  {
    label: "Site d'intervention",
    placeholder: "Site d'intervention",
    name: "Site d'intervention",
    elementType: "input",
  },
  {
    label: "Infrastructures",
    placeholder: "Infrastructures",
    name: "Infrastructures",
    elementType: "input",
  },
  {
    label: "Ouvrage",
    placeholder: "Ouvrage",
    name: "Ouvrage",
    elementType: "input",
  },
  {
    label: "Coordonnées",
    placeholder: "Coordonnées",
    name: "Coordonnées",
    elementType: "input",
  },
  {
    label: "Lieu d'implantation",
    placeholder: "Lieu d'implantation",
    name: "Lieu d'implantation",
    elementType: "input",
  },
];
