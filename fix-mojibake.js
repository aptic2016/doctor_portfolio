require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function fixMojibake(str) {
  if (!str) return str;
  // Fix double-encoded UTF-8
  try {
    const buf = Buffer.from(str, 'latin1');
    const decoded = buf.toString('utf8');
    // Check if decoding produced valid text (no replacement chars)
    if (!decoded.includes('\uFFFD') && decoded !== str) {
      return decoded;
    }
  } catch {}
  return str;
}

(async () => {
  // Fix experience entries
  const exps = await prisma.experience.findMany();
  let fixed = 0;
  for (const exp of exps) {
    const newTitle = fixMojibake(exp.title);
    const newDesc = fixMojibake(exp.description);
    const newOrg = fixMojibake(exp.organization);
    if (newTitle !== exp.title || newDesc !== exp.description || newOrg !== exp.organization) {
      await prisma.experience.update({
        where: { id: exp.id },
        data: { title: newTitle, description: newDesc, organization: newOrg },
      });
      fixed++;
      console.log(`Fixed experience: ${exp.id}`);
    }
  }

  // Fix publication entries
  const pubs = await prisma.publication.findMany();
  for (const pub of pubs) {
    const newTitle = fixMojibake(pub.title);
    const newJournal = fixMojibake(pub.journal);
    if (newTitle !== pub.title || newJournal !== pub.journal) {
      await prisma.publication.update({
        where: { id: pub.id },
        data: { title: newTitle, journal: newJournal },
      });
      fixed++;
      console.log(`Fixed publication: ${pub.id}`);
    }
  }

  // Fix qualification entries
  const quals = await prisma.qualification.findMany();
  for (const q of quals) {
    const newName = fixMojibake(q.name);
    const newInst = fixMojibake(q.institution);
    if (newName !== q.name || newInst !== q.institution) {
      await prisma.qualification.update({
        where: { id: q.id },
        data: { name: newName, institution: newInst },
      });
      fixed++;
      console.log(`Fixed qualification: ${q.id}`);
    }
  }

  // Fix article entries
  const articles = await prisma.article.findMany();
  for (const a of articles) {
    const newTitle = fixMojibake(a.title);
    const newContent = fixMojibake(a.content);
    if (newTitle !== a.title || newContent !== a.content) {
      await prisma.article.update({
        where: { id: a.id },
        data: { title: newTitle, content: newContent },
      });
      fixed++;
      console.log(`Fixed article: ${a.id}`);
    }
  }

  console.log(`Total fixed: ${fixed}`);
  await prisma.$disconnect();
})();
