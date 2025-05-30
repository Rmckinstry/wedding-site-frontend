import { FormControl, NativeSelect } from "@mui/material";

function MobileSelectNav({ tabValue = 0, handleChange }) {
  return (
    <>
      <div className="flex-row">
        <FormControl fullWidth>
          <NativeSelect
            value={tabValue}
            onChange={handleChange}
            sx={{
              color: "var(--default-text)", // Use your CSS variable
              fontSize: "1.5rem",
              fontFamily: "Cormorant Garamond",
              fontWeight: 600,
            }}
          >
            <option value={0}>Home</option>
            <option value={1}>Travel</option>
            <option value={2}>FAQ</option>
            <option value={3}>Registry</option>
          </NativeSelect>
        </FormControl>
      </div>
    </>
  );
}

export default MobileSelectNav;
