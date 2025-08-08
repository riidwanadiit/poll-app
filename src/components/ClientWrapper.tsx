"use client";

import React from "react";

type ClientWrapperProps<T extends object = object> = {
  Component: React.ComponentType<T>;
  componentProps?: T;
};

function ClientWrapper<T extends object = object>({
  Component,
  componentProps,
}: ClientWrapperProps<T>) {
  return <Component {...(componentProps ?? {} as T)} />;
}

export default ClientWrapper;