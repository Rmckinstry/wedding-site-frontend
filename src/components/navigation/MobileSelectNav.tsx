import { FormControl, NativeSelect } from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

function MobileSelectNav({ tabValue = 0, handleChange }) {
  return (
    <>
      <div
        id="mobile-nav-bar-container"
        className="flex-row"
        style={{ borderBottomStyle: "solid", borderColor: "#64644015", borderWidth: "3px" }}
      >
        <FormControl fullWidth>
          <NativeSelect
            value={tabValue}
            onChange={handleChange}
            sx={{
              color: "var(--default-text)",
              fontSize: "2rem",
              fontFamily: "Cormorant Garamond",
              fontWeight: 600,
            }}
            IconComponent={() => <ArrowDropDownIcon sx={{ fontSize: 32 }} />}
          >
            <option value={0}>Home</option>
            <option value={1}>Travel</option>
            <option value={2}>RSVP</option>
            <option value={3}>Registry</option>
            <option value={4}>FAQ</option>
          </NativeSelect>
        </FormControl>
      </div>
    </>
  );
}

export default MobileSelectNav;
