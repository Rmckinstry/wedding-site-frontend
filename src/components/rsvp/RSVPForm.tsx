import React, { useState, useEffect, useCallback } from "react";
import { Stepper, Step, StepLabel } from "@mui/material";

type RSVP = {
  guestId: number;
  attendance: boolean | null;
  spotify: string[];
};

type GroupData = {
  group_name: string;
  guests: Guest[];
};

type Guest = {
  added_by_guest_id: null;
  additional_guest_type: null;
  email: string;
  group_id: number;
  group_name: string;
  guest_id: number;
  has_dependents: boolean;
  name: string;
  plus_one_allowed: boolean;
  song_requests: number;
};

type RSVPFormProps = {
  groupData: GroupData;
};

const steps = ["Guests", "Song Requests", "Confirmation"];

function RSVPForm({ groupData }: RSVPFormProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [rsvps, setRsvps] = useState<RSVP[]>([]);

  // Memoize resetRSVPs
  const resetRSVPs = useCallback(() => {
    if (groupData && groupData.guests) {
      const newRsvps: RSVP[] = groupData.guests.map((guest) => ({
        guestId: guest.guest_id,
        attendance: null,
        spotify: [""],
      }));
      setRsvps(newRsvps);
      console.log(newRsvps);
    }
  }, [groupData, setRsvps]);

  // initial rsvps setter
  useEffect(() => {
    resetRSVPs();
  }, [groupData, resetRSVPs]);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    resetRSVPs();
    setActiveStep(0);
  };

  const handleSubmit = () => {};

  return (
    <>
      <div id="rsvp-form-controller">
        <div>
          <Stepper activeStep={activeStep}>
            {steps.map((label, index) => {
              const stepProps: { completed?: boolean } = {};
              return (
                <Step key={label} {...stepProps}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              );
            })}
          </Stepper>
          {activeStep === steps.length ? (
            <div>{/* submitting div and also rsvp confirmation here */}</div>
          ) : (
            <div>
              {/* Guest RSVP Question */}
              {activeStep === 0 && (
                <div>
                  <button onClick={handleNext}>Next</button>
                </div>
              )}
              {activeStep === 1 && (
                <div>
                  <button onClick={handleBack}>Back</button>
                  <button onClick={handleNext}>Next</button>
                  {/* Song Requests Card */}
                </div>
              )}
              {activeStep === 2 && (
                <div>
                  <button onClick={handleBack}>Back</button>
                  <button onClick={handleReset}>Reset</button>
                  <button onClick={handleSubmit}>Submit RSVP</button>
                  {/* Confirmation Card */}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default RSVPForm;
