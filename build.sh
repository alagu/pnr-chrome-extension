# Copy this file to a directory above pnr-chrome-extension
version=`cat pnr-chrome-extension/manifest.json | grep version | grep -v manifest | cut -d'"' -f4`
mkdir -p builds/
mv *zip builds/
rm -rf pnr_rail_prod*
cp -r pnr-chrome-extension pnr_rail_prod
cd pnr_rail_prod
rm -rf .git*
rm -rf .DS_Store
rm -rf *~
cd ..
zip -r pnr_rail_prod-$version.zip pnr_rail_prod/
rm -rf pnr_rail_prod
