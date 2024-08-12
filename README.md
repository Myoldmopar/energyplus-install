# EnergyPlus Install GitHub Action

This action retrieves an EnergyPlus install and provides the path to the EnergyPlus directory.

## Inputs

### `tag`

**Required** The tag of the EnergyPlus release to retrieve.  This will typically be of the form `v24.1.0` for major releases, but custom releases may have any name.

### `hardened`

**Optional** Whether to grab a hardened version or not.  Default is `False`.  Only meaningful on Windows.

### `os_version_override`

**Optional** An overriding version of an OS to use when specifying an EnergyPlus package.  For Ubuntu, this is something like 20.04 or 22.04.  For Mac this is something like 12.1.  For Windows this is ignored.

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
