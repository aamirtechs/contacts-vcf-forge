"use strict";
function parseCSV(text){var rows=[];var row=[];var cur="";var q=false;var s=String(text||"");
for(var i=0;i<s.length;i++){var c=s[i];
if(q){if(c==='"'){if(s[i+1]==='"'){cur+='"';i++;}else q=false;}else cur+=c;}
else if(c==='"')q=true;else if(c===","){row.push(cur);cur="";}else if(c==="\n"){row.push(cur);rows.push(row);row=[];cur="";}else if(c!=="\r")cur+=c;}
row.push(cur);rows.push(row);return rows.filter(function(r){return r.some(function(c){return String(c).trim()!=="";});});}
function rowsToObjects(rows){if(!rows.length)return[];var h=rows[0].map(function(x){return String(x).trim();});return rows.slice(1).map(function(r){var o={};h.forEach(function(k,i){o[k]=r[i]||"";});return o;});}
function cleanPhone(raw){var s=String(raw||"").trim();if(!s)return{value:"",ok:false,issue:"empty"};
var plus=s.replace(/[^0-9+]/g,"");var out;if(plus.startsWith("+"))out="+"+plus.slice(1).replace(/\+/g,"");else out=plus.replace(/\+/g,"");
var digits=out.replace(/\D/g,"");var ok=digits.length>=7&&digits.length<=15;return{value:out,ok:ok,issue:ok?"":"phone has "+digits.length+" digits"};}
function escapeVCard(v){return String(v==null?"":v).replace(/\\/g,"\\\\").replace(/;/g,"\\;").replace(/,/g,"\\,").replace(/\r?\n/g,"\\n");}
function foldLine(line){if(line.length<=75)return line;var out=[];var cur=line.slice(0,75);out.push(cur);var rest=line.slice(75);while(rest.length){out.push(" "+rest.slice(0,74));rest=rest.slice(74);}return out.join("\r\n");}
function guessMapping(headers){var map={};var rules={firstName:/first/i,lastName:/last/i,phone:/phone|mobile|cell/i,email:/e-?mail/i,org:/org|company/i,title:/title|job/i,address:/addr|street/i,notes:/note/i};
(headers||[]).forEach(function(h){Object.keys(rules).forEach(function(k){if(map[k])return;if(rules[k].test(h))map[k]=h;});
if(!map.firstName&&/^(full )?name$/i.test(h))map.firstName=h;});return map;}
function mapRow(row,mapping){var c={firstName:"",lastName:"",phones:[],emails:[],org:"",title:"",address:"",notes:""};
Object.keys(mapping||{}).forEach(function(k){var col=mapping[k];var v=col?String(row[col]||"").trim():"";
if(k==="phone"&&v)c.phones=[v];else if(k==="email"&&v)c.emails=[v];else if(k in c)c[k]=v;});
if(mapping&&mapping.phone2&&row[mapping.phone2])c.phones.push(String(row[mapping.phone2]).trim());
if(mapping&&mapping.email2&&row[mapping.email2])c.emails.push(String(row[mapping.email2]).trim());return normalizeContact(c);}
function normalizeContact(c){var out=Object.assign({},c);out.phones=(c.phones||[]).map(function(p){return cleanPhone(p).value;}).filter(Boolean);out.emails=(c.emails||[]).map(function(e){return String(e).trim().toLowerCase();}).filter(Boolean);out.fullName=((c.firstName||"")+" "+(c.lastName||"")).trim()||c.fullName||"";return out;}
function buildVCard(contact,version){var c=normalizeContact(contact);var v=version==="4.0"?"4.0":"3.0";var lines=["BEGIN:VCARD","VERSION:"+v];
if(v==="4.0"){lines.push("FN:"+escapeVCard(c.fullName));lines.push("N:"+escapeVCard(c.lastName||"")+";"+escapeVCard(c.firstName||"")+";;;");}
else{lines.push("N:"+escapeVCard(c.lastName||"")+";"+escapeVCard(c.firstName||"")+";;;");lines.push("FN:"+escapeVCard(c.fullName));}
(c.phones||[]).forEach(function(p){lines.push(v==="4.0"?"TEL;VALUE=uri:tel:"+p:"TEL;TYPE=CELL:"+p);});
(c.emails||[]).forEach(function(e){lines.push("EMAIL:"+e);});
if(c.org)lines.push("ORG:"+escapeVCard(c.org));if(c.title)lines.push("TITLE:"+escapeVCard(c.title));if(c.address)lines.push("ADR:;;"+escapeVCard(c.address)+";;;;");if(c.notes)lines.push("NOTE:"+escapeVCard(c.notes));
lines.push("END:VCARD");return lines.map(foldLine).join("\r\n")+"\r\n";}
function keyOf(c){var n=normalizeContact(c);if(n.phones.length)return"p:"+n.phones[0].replace(/\D/g,"");if(n.emails.length)return"e:"+n.emails[0];return"";}
function findDuplicates(contacts){var seen={};var dupes=[];(contacts||[]).forEach(function(c,i){var k=keyOf(c);if(!k)return;if(seen[k]!=null)dupes.push({index:i,duplicateOf:seen[k],key:k});else seen[k]=i;});return dupes;}
function mergeContacts(a,b){var x=normalizeContact(a),y=normalizeContact(b);var phones=x.phones.slice();y.phones.forEach(function(p){if(!phones.includes(p))phones.push(p);});
var emails=x.emails.slice();y.emails.forEach(function(e){if(!emails.includes(e))emails.push(e);});
return{firstName:x.firstName||y.firstName,lastName:x.lastName||y.lastName,fullName:x.fullName||y.fullName,phones:phones,emails:emails,org:x.org||y.org,title:x.title||y.title,address:x.address||y.address,notes:[x.notes,y.notes].filter(Boolean).join(" | ")};}
function dedupe(contacts){var byKey={};var out=[];(contacts||[]).forEach(function(c){var k=keyOf(c);if(k&&byKey[k]!=null){out[byKey[k]]=mergeContacts(out[byKey[k]],c);}else{if(k)byKey[k]=out.length;out.push(normalizeContact(c));}});return out;}
function splitChunks(contacts,perFile){var n=Math.max(1,Number(perFile)||contacts.length||1);var chunks=[];for(var i=0;i<contacts.length;i+=n)chunks.push(contacts.slice(i,i+n));return chunks.length?chunks:[[]];}
function buildVCF(contacts,version){return(contacts||[]).map(function(c){return buildVCard(c,version);}).join("");}
const api={parseCSV:parseCSV,rowsToObjects:rowsToObjects,cleanPhone:cleanPhone,escapeVCard:escapeVCard,foldLine:foldLine,guessMapping:guessMapping,mapRow:mapRow,normalizeContact:normalizeContact,buildVCard:buildVCard,findDuplicates:findDuplicates,mergeContacts:mergeContacts,dedupe:dedupe,splitChunks:splitChunks,buildVCF:buildVCF};
if(typeof module!=="undefined"&&module.exports){module.exports=api;}
if(typeof window!=="undefined"){window.ContactsVcfForge=api;}
