// src/components/ui/spinner-button.jsx
import React from "react";
import { Button } from "./button";
import { Spinner } from "./spinner";

export function SpinnerButton() {
  return (
    <div className="flex flex-col items-center gap-4">
      <Button disabled size="sm">
        <Spinner />
        Loading...
      </Button>

      <Button variant="outline" disabled size="sm">
        <Spinner />
        Please wait
      </Button>

      <Button variant="secondary" disabled size="sm">
        <Spinner />
        Processing
      </Button>
    </div>
  );
}
