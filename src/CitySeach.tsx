import * as React from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { CITIES } from "./mock";
import { CircularProgress } from "@mui/material";

interface City {
  name: string;
  key: string;
  country: string;
}

function CitySearch() {
  const [value, setValue] = React.useState<City | null>(null);
  const [inputValue, setInputValue] = React.useState("");
  const [options, setOptions] = React.useState<readonly City[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const doFetch = React.useCallback((request: string) => {
    setOptions([]);
    setIsLoading(true);
    if ((window as any).REAL) {
      return window
        .fetch(
          `https://dataservice.accuweather.com/locations/v1/cities/autocomplete?apikey=${
            import.meta.env.VITE_API_KEY
          }&q=${request}`
        )
        .then((data) => data.json())
        .finally(() => setIsLoading(false));
    } else {
      return new Promise((resolve) => {
        setTimeout(() => {
          return resolve(CITIES);
        }, 1000);
      }).finally(() => setIsLoading(false));
    }
  }, []);

  React.useEffect(() => {
    if (inputValue === "") {
      setOptions(value ? [value] : []);
      return undefined;
    }

    const timer = setTimeout(() => {
      doFetch(inputValue).then((data: any) =>
        setOptions(
          data.map((d: any) => ({
            name: d.LocalizedName,
            key: d.Key,
            country: d.Country.LocalizedName,
          }))
        )
      );
    }, 250);

    return () => clearTimeout(timer);
  }, [value, inputValue, doFetch]);

  return (
    <Autocomplete
      sx={{ width: 300 }}
      getOptionLabel={(option: City) => option.name}
      filterOptions={(x) => x}
      options={options}
      autoComplete
      isOptionEqualToValue={(option, value) => option.key === value.key}
      includeInputInList
      filterSelectedOptions
      value={value}
      noOptionsText={isLoading ? <CircularProgress /> : "No locations found"}
      onChange={(_event: any, newValue: any | null) => {
        setValue(newValue);
      }}
      onInputChange={(_event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      renderInput={(params) => (
        <TextField {...params} label="Add a location" fullWidth />
      )}
      renderOption={(props, option) => {
        return (
          <li {...props} key={option.key}>
            <Grid container alignItems="center">
              <Grid>
                <Box>{option.name}</Box>
                <Typography variant="body2" color="text.secondary">
                  {option.country}
                </Typography>
              </Grid>
            </Grid>
          </li>
        );
      }}
    />
  );
}
export default CitySearch;
