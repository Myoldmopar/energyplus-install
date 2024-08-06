# EnergyPlus Install javascript action

This action retrieves an EnergyPlus install and provides the path to the EnergyPlus directory.

## Inputs

### `version`

**Required** The version of EnergyPlus to install. Default for now is `"24.1.0"`. I think this may change to a tag.

### `hardened`

**Optional** Whether to grab a hardened version or not.  Default is `False`.  Only meaningful on Windows for now.

## Outputs

### `energyplus_path`

Path to the EnergyPlus install.

## Example usage

```yaml
uses: myoldmopar/energyplus-install@v0.1
with:
  version: '23.2.0'
```
