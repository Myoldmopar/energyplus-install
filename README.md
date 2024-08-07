# EnergyPlus Install GitHub Action

This action retrieves an EnergyPlus install and provides the path to the EnergyPlus directory.

## Inputs

### `tag`

**Required** The tag of the EnergyPlus release to retrieve.  This will typically be of the form `v24.1.0` for major releases, but custom releases may have any name.

### `hardened`

**Optional** Whether to grab a hardened version or not.  Default is `False`.  Only meaningful on Windows.

### `repository`

**Optional** The GitHub repository to download the release asset, as "Owner/Repository", with a default of "NREL/EnergyPlus".

## Outputs

### `energyplus_directory`

Path to the EnergyPlus install.

## Example usage

```yaml
uses: myoldmopar/energyplus-install@v0.2
with:
  tag: '23.2.0'
```
