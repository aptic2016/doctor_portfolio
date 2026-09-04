const{PrismaClient}=require('./node_modules/@prisma/client')
const p=new PrismaClient()
Promise.all([
  p.siteSettings.findFirst({select:{agencyName:true,agencyLabel:true,showAgencyBranding:true,agencyUrl:true}}),
  p.profile.findFirst({select:{displayName:true,fullName:true}})
]).then(function(r){console.log(JSON.stringify(r,null,2));p.$disconnect()})
