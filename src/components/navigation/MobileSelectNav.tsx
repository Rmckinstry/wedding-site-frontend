import { FormControl, InputLabel, NativeSelect } from "@mui/material";

function MobileSelectNav({ tabValue = 0, handleChange }) {
  return (
    <>
      <div className="flex-row">
        <FormControl fullWidth>
          <InputLabel variant="standard" htmlFor="uncontrolled-native">
            Menu
          </InputLabel>
          <NativeSelect value={tabValue} onChange={handleChange}>
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
