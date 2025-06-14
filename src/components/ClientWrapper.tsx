"use client";

import React from "react";

type ClientWrapperProps = {
  Component: React.ComponentType<any>;
  componentProps?: Record<string, any>;
};

const ClientWrapper: React.FC<ClientWrapperProps> = ({ Component, componentProps }) => {
  return <Component {...componentProps} />;
};

export default ClientWrapper;
