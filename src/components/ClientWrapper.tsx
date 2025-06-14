"use client";

import React from "react";

type ClientWrapperProps<T extends Record<string, unknown> = {}> = {
  Component: React.ComponentType<T>;
  componentProps?: T;
};

function ClientWrapper<T extends Record<string, unknown> = {}>({
  Component,
  componentProps,
}: ClientWrapperProps<T>) {
  return <Component {...(componentProps ?? ({} as T))} />;
}

export default ClientWrapper;
