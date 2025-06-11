import { Command, Flags } from '@oclif/core';

import { gitmojis } from '../utils/gitmojis.js';

export default class List extends Command {
  static override description = 'List available gitmojis with their descriptions';
static override examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --search feature',
    '<%= config.bin %> <%= command.id %> --category bug',
  ];
static override flags = {
    category: Flags.string({
      char: 'c',
      description: 'filter by category (feature, bug, docs, etc.)',
    }),
    codes: Flags.boolean({
      default: false,
      description: 'show gitmoji codes instead of emojis',
    }),
    search: Flags.string({
      char: 's',
      description: 'search gitmojis by description or code',
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(List);

    let filteredGitmojis = gitmojis;

    // Apply search filter
    if (flags.search) {
      const searchTerm = flags.search.toLowerCase();
      filteredGitmojis = filteredGitmojis.filter(g => 
        g.description.toLowerCase().includes(searchTerm) ||
        g.code.toLowerCase().includes(searchTerm) ||
        g.name.toLowerCase().includes(searchTerm)
      );
    }

    // Apply category filter
    if (flags.category) {
      const categoryMap = this.getCategoryMap();
      const categoryGitmojis = categoryMap[flags.category.toLowerCase()];
      
      if (categoryGitmojis) {
        filteredGitmojis = filteredGitmojis.filter(g => 
          categoryGitmojis.includes(g.code)
        );
      } else {
        this.error(`Unknown category '${flags.category}'. Available categories: ${Object.keys(categoryMap).join(', ')}`);
      }
    }

    if (filteredGitmojis.length === 0) {
      this.log('No gitmojis found matching your criteria.');
      return;
    }

    // Display results
    this.log(`📋 Available Gitmojis (${filteredGitmojis.length}/${gitmojis.length}):\\n`);

    const maxCodeLength = Math.max(...filteredGitmojis.map(g => g.code.length));

    for (const gitmoji of filteredGitmojis) {
      const display = flags.codes ? gitmoji.code : gitmoji.emoji;
      const code = gitmoji.code.padEnd(maxCodeLength);
      this.log(`${display} ${code} - ${gitmoji.description}`);
    }

    if (flags.search || flags.category) {
      this.log('\n💡 Tip: Remove filters to see all available gitmojis');
    } else {
      this.log('\n💡 Tip: Use --search or --category to filter results');
      this.log('   Examples: --search bug, --category feature');
    }
  }

  private getCategoryMap(): Record<string, string[]> {
    return {
      breaking: [':boom:'],
      bug: [':bug:', ':ambulance:', ':adhesive_bandage:', ':green_heart:'],
      build: [':construction_worker:', ':green_heart:', ':arrow_up:', ':arrow_down:'],
      chore: [':wrench:', ':hammer:', ':gear:', ':package:'],
      ci: [':construction_worker:', ':green_heart:', ':whale:'],
      config: [':wrench:', ':gear:', ':heavy_plus_sign:', ':heavy_minus_sign:'],
      deps: [':arrow_up:', ':arrow_down:', ':heavy_plus_sign:', ':heavy_minus_sign:'],
      docs: [':memo:', ':bulb:', ':card_file_box:', ':children_crossing:'],
      feature: [':sparkles:', ':zap:', ':construction:', ':heavy_plus_sign:'],
      hotfix: [':ambulance:', ':fire:'],
      perf: [':zap:', ':racehorse:', ':chart_with_upwards_trend:'],
      refactor: [':recycle:', ':truck:', ':fire:', ':wastebasket:'],
      release: [':bookmark:', ':rocket:', ':tada:'],
      revert: [':rewind:'],
      security: [':lock:', ':passport_control:'],
      style: [':art:', ':lipstick:', ':rotating_light:', ':recycle:'],
      test: [':white_check_mark:', ':construction_worker:', ':green_heart:'],
      wip: [':construction:'],
    };
  }
}
