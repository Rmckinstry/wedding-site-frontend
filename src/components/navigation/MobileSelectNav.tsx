import { FormControl, NativeSelect } from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

function MobileSelectNav({ tabValue = 0, handleChange }) {
  return (
    <>
      <div className="flex-row">
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
            IconComponent={() => <ArrowDropDownIcon sx={{ fontSize: 100 }} />}
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
