function DayOf() {
  return (
    <div id="day-of-container" className="flex-col" style={{ gap: "2rem" }}>
      <div id="day-of-title-container" className="flex-col">
        <p className="font-lg">Wedding Day!</p>
      </div>
      <div id="portal-horiz-divider"></div>

      <div id="day-of-time-date-container" className="flex-col contain-text-center">
        <p className="font-med-lg strong-text">November 15, 2025</p>
        <p className="font-med">Gates open at 3:00 PM</p>
        <p className="font-med">
          Ceremony starts <span className="underline">promptly</span> at 3:30 PM
        </p>
        <p className="font-med">Bride and Groom send off at 8:30 PM</p>
      </div>
      <div id="day-of-address-container" className="flex-col contain-text-center">
        <p className="font-med-lg strong-text">Heartwood Hall</p>
        <a
          href="https://maps.app.goo.gl/jxxs5PgddSEh2RC37"
          className="secondary-text font-med"
          target="_blank"
          rel="noreferrer"
        >
          2665 Raleigh Lagrange Dr, Rossville, TN 38066
        </a>
      </div>
      <div id="portal-horiz-divider"></div>
      <div id="day-of-misc-container" className="flex-col font-sm-med contain-text-center">
        <p>Parking is available at the venue.</p>
        <p>Visit the FAQ tab for more info.</p>
      </div>
    </div>
  );
}

export default DayOf;
