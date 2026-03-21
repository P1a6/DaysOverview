export async function getTodaysTasks() {
  const accessToken = process.env.EXPO_PUBLIC_TICKTICK_ACCESS_TOKEN;
  
  if (!accessToken) {
    throw new Error('TICKTICK_ACCESS_TOKEN not found in .env');
  }

  console.log("📋 Fetching today's tasks from TickTick...");

  try {
    // First, get all projects
    const projectsResponse = await fetch('https://api.ticktick.com/open/v1/project', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!projectsResponse.ok) {
      const error = await projectsResponse.text();
      console.error("TickTick projects error:", error);
      throw new Error(`TickTick API error: ${projectsResponse.status}`);
    }

    const projects = await projectsResponse.json();
    console.log(`📁 Found ${projects.length} projects`);

    // Fetch tasks from all projects
    const allTasks = [];
    
    for (const project of projects) {
      console.log(`🔍 Fetching tasks from: ${project.name} (${project.id})`);
      
      try {
        const tasksResponse = await fetch(`https://api.ticktick.com/open/v1/project/${project.id}/task`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        console.log(`  📡 Response status: ${tasksResponse.status}`);

        if (!tasksResponse.ok) {
          const errorText = await tasksResponse.text();
          console.error(`  ❌ Error for ${project.name}:`, errorText);
          continue;
        }

        const projectTasks = await tasksResponse.json();
        console.log(`  ✅ ${project.name}: ${projectTasks.length} tasks`);
        
        if (projectTasks.length > 0) {
          console.log(`  📝 First task:`, projectTasks[0].title);
        }
        
        allTasks.push(...projectTasks);
      } catch (err) {
        console.error(`  ❌ Exception for ${project.name}:`, err);
      }
    }

    console.log(`📋 Total tasks found: ${allTasks.length}`);

    if (allTasks.length === 0) {
      console.warn("⚠️ No tasks found in any project!");
      return [];
    }

    // Filter for incomplete tasks
    const incompleteTasks = allTasks.filter((task: any) => {
      return task.status !== 2; // 2 = completed
    });

    console.log(`✅ Returning ${incompleteTasks.length} incomplete tasks`);
    return incompleteTasks;
  } catch (error: any) {
    console.error("❌ Error fetching tasks:", error);
    throw error;
  }
}
