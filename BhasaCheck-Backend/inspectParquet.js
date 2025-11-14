import { parquetRead } from "hyparquet";
import { readFileSync } from "fs";

async function inspectParquet() {
  console.log('📂 Inspecting parquet file structure...\n');
  
  const buffer = readFileSync("./data/6.parquet");
  const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  
  await parquetRead({
    file: arrayBuffer,
    onComplete: (data) => {
      console.log(`✅ Total rows: ${data.length}\n`);
      
      if (data.length > 0) {
        const firstRow = data[0];
        console.log('📋 Columns in parquet file:');
        console.log(Object.keys(firstRow));
        console.log('\n📝 First row sample data:');
        for (const [key, value] of Object.entries(firstRow)) {
          const val = typeof value === 'bigint' ? value.toString() : value;
          console.log(`  [${key}]: ${typeof value === 'object' ? JSON.stringify(val).substring(0, 100) : val}`);
        }
        
        console.log('\n📝 Second row (for comparison):');
        if (data[1]) {
          for (const [key, value] of Object.entries(data[1])) {
            const val = typeof value === 'bigint' ? value.toString() : value;
            console.log(`  [${key}]: ${typeof value === 'object' ? JSON.stringify(val).substring(0, 100) : val}`);
          }
        }
      }
    }
  });
}

inspectParquet().catch(console.error);
